/// <reference types="powerapps-component-framework" />
import { IInputs, IOutputs } from "./generated/ManifestTypes";

interface PageContextLike {
  entityId?: string;
  entityTypeName?: string;
}

interface ExtendedContext extends ComponentFramework.Context<IInputs> {
  page?: PageContextLike;
}

declare const Xrm: {
  Navigation: {
    navigateTo(
      pageInput: {
        pageType: "custom";
        name: string;
        entityName?: string;
        recordId?: string;
      },
      navigationOptions: {
        target: 2;
        position: 1;
        width: { value: number; unit: "%" };
        height: { value: number; unit: "%" };
        title: string;
      }
    ): Promise<void>;
  };
};

export class OpenCustomPageButton
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private container!: HTMLDivElement;
  private button!: HTMLButtonElement;
  private context!: ComponentFramework.Context<IInputs>;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.context = context;
    this.container = container;

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.style.padding = "8px 16px";
    this.button.style.borderRadius = "6px";
    this.button.style.border = "1px solid #d0d0d0";
    this.button.style.background = "#0078d4";
    this.button.style.color = "#ffffff";
    this.button.style.cursor = "pointer";

    this.button.onclick = () => this.openCustomPage();

    this.container.appendChild(this.button);

    this.render();
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.context = context;
    this.render();
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    if (this.button) {
      this.button.onclick = null;
    }
  }

  private render(): void {
    const buttonText = this.context.parameters.buttonText.raw || "Open";
    const pageContext = this.context as ExtendedContext;
    const recordId = pageContext.page?.entityId;

    this.button.innerText = buttonText;
    this.button.disabled = !recordId;
    this.button.title = recordId ? "" : "Save the record first";

    this.button.style.opacity = recordId ? "1" : "0.6";
    this.button.style.cursor = recordId ? "pointer" : "not-allowed";
  }

  private openCustomPage(): void {
    const customPageName = this.context.parameters.customPageName.raw;
    const dialogTitle = this.context.parameters.dialogTitle.raw || "Open";

    const pageContext = this.context as ExtendedContext;
    const entityName = pageContext.page?.entityTypeName;
    const recordId = pageContext.page?.entityId;

    if (!customPageName || !recordId) {
      return;
    }

    Xrm.Navigation.navigateTo(
      {
        pageType: "custom",
        name: customPageName,
        entityName,
        recordId
      },
      {
        target: 2,
        position: 1,
        width: { value: 60, unit: "%" },
        height: { value: 70, unit: "%" },
        title: dialogTitle
      }
    ).catch(() => {
      // no-op
    });
  }
}
